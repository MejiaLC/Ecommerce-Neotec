const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const controller = {};

controller.showLogin = (req, res) => {
  res.render("login");
};

controller.login = (req, res) => {
  const email = req.body.email;
  const contraseña = req.body.contraseña;
  /*     const sessionEmail = req.session.email = email;
    const sessionPass = req.session.contraseña = contraseña */
  req.flash("user", req.body.email);
  req.flash("message", "Datos incorrectos");
  res.cookie("user", req.body.email);

  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM registro WHERE email = ?",
      [email],
      async (err, datos) => {
        if (datos.length > 0) {
          const comparison = await bcrypt.compare(
            contraseña,
            datos[0].contraseña
          );
          console.log(comparison);
          if (comparison) {
            res.redirect("/home");
          } else {
            res.redirect("/");
          }
        } else {
          res.redirect("/");
        }
      }
    );
  });
};

controller.showRegister = (req, res) => {
  res.render("registro");
};

controller.register = async (req, res) => {
  const nombre = req.body.usuario;
  const email = req.body.email;
  const direccion = req.body.direccion;
  const contraseña = req.body.contraseña;
  const encryptedPassword = await bcrypt.hash(contraseña, 10);

  req.getConnection((err, conn) => {
    conn.query(
      "INSERT INTO registro (usuario, email, direccion, contraseña) VALUES(?,?,?,?)",
      [nombre, email, direccion, encryptedPassword],
      (err, datos) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      }
    );
  });
};

controller.list = (req, res) => {
  const user = req.cookies.user;

  console.log(user);

  if (user == "admin@hotmail.com") {
    estado = true;
  } else {
    estado = false;
  }

  console.log(estado);

  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario WHERE cantidad > 0", (err, datos) => {
      if (err) {
        console.log(err);
      }

      let imagenes = fs.readdirSync(path.join(__dirname, "../dbimages/"));

      res.render("index", {
        user: user,
        estado: estado,
        data: datos,
        imagenes,
      });
    });
  });
};

controller.panel = (req, res) => {
  res.render("admin");
};

controller.list2 = (req, res) => {
  const user = req.cookies.user;

  console.log(user);

  if (user == "admin@hotmail.com") {
    estado = true;
  } else {
    estado = false;
  }

  console.log(estado);

  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario", (err, datos) => {
      if (err) {
        console.log(err);
      }

      let imagenes = fs.readdirSync(path.join(__dirname, "../dbimages/"));

      res.render("index", {
        user: user,
        estado: estado,
        data: datos,
        imagenes,
      });
    });
  });
};

controller.inventario = (req, res) => {
  let producto = req.body.producto;
  let descripcion = req.body.descripcion;
  let precio = req.body.precio;
  let cantidad = req.body.cantidad;
  let accion = "INSERTADO";

  req.getConnection((err, conn) => {
    conn.query("INSERT INTO control (producto, administrador, accion) VALUES(?,?,?)",
    [producto, req.cookies.user, accion], (err, datos) => {
      if(err){
        console.log(err)
      }
      else{
        console.log(datos);
      }
    });
  })

  req.getConnection((err, conn) => {
    let imagen = fs.readFileSync(
      path.join(__dirname, "../images/" + req.file.filename)
    );
    conn.query(
      "INSERT INTO inventario (producto, descripcion, precio, cantidad, imagen) VALUES (?,?,?,?,?)",
      [producto, descripcion, precio, cantidad, imagen],
      (err, datos) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/admin");
      }
    );
  });
};

controller.productos = (req, res) => {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario", (err, datos) => {
      if (err) {
        console.log(err);
      }
      datos.map((info) => {
        fs.writeFileSync(
          path.join(__dirname, "../dbimages/" + info.id + "-neotec.png"),
          info.imagen
        );
      });

      let imagenes = fs.readdirSync(path.join(__dirname, "../dbimages/"));

      res.render("admin", {
        data: datos,
        imagenes,
      });
    });
  });
};

controller.update = (req, res) => {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario WHERE id = ?", [id], (err, datos) => {
      res.render("updateProducto", {
        data: datos[0],
      });
    });
  });
};

controller.delete = (req, res) => {
  const id = req.params.id;
  let producto = "";
  let accion = "ELIMINADO";

  req.getConnection((err, conn) => {
    conn.query('SELECT producto FROM inventario WHERE id = ?',[id], (err, datos) => {
      if(err){
        console.log(err)
      }
      else{
        producto = datos[0].producto
        conn.query("INSERT INTO control (producto, administrador, accion) VALUES(?,?,?)",
        [producto, req.cookies.user, accion], (err, datos) => {
          if(err){
            console.log(err)
          }
          else{
            console.log(datos);
          }
        });
      }
    })
  });

  req.getConnection((err, conn) => {
    conn.query("DELETE FROM inventario WHERE id = ?", [id], (err, datos) => {
      fs.unlinkSync(path.join(__dirname, "../dbimages/" + id + "-neotec.png"));

      res.redirect("/admin");
    });
  });  
};

controller.producto = (req, res) => {
  const id = req.params.id;
  res.cookie("producto", id);

  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario WHERE id = ?", [id], (err, datos) => {
      datos.map((info) => {
        fs.writeFileSync(
          path.join(__dirname, "../dbimages2/" + info.id + "-neotec.png"),
          info.imagen
        );
      });

      //let imagen = fs.readFileSync(path.join(__dirname, '../images/' + req.file.filename));
      let imagenes = fs.readFileSync(
        path.join(__dirname, "../dbimages2/" + id + "-neotec.png")
      );
      res.render("producto", {
        data: datos[0],
        imagenes,
      });
    });
  });
};

controller.imagen = (req, res) => {
  const id = req.cookies.producto;
  res.sendFile(path.join(__dirname, "../dbimages/" + id + "-neotec.png"));
};

controller.carrito = (req, res) => {
  const id = req.body.id;
  const producto = req.body.producto;
  const descripcion = req.body.descripcion;
  const precio = req.body.precio;
  const cantidad = req.body.cantidad;

  const carritoUser = req.cookies.user;
  console.log("Usuario: " + carritoUser);
  res.cookie("idProducto", id);

  req.getConnection((err, conn) => {
    conn.query(
      "INSERT INTO carrito (producto, descripcion, precio, cantidad, idProducto, comprador) VALUES (?,?,?,?,?,?)",
      [producto, descripcion, precio, cantidad, id, carritoUser],
      (err, datos) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/carrito");
        }
      }
    );
  });

  /*     req.getConnection((err, conn) => {
        conn.query('UPDATE inventario set cantidad = cantidad - (?) WHERE id = ?', [cantidad, id], (err, datos) => {
        });
    }); */
};

controller.showCarrito = (req, res) => {
  const id = req.cookies.idProducto;

  const carritoUser = req.cookies.user;

  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM carrito WHERE comprador = ?",
      [carritoUser],
      (err, datos) => {
        if (err) {
          console.log(err);
        }

        let imagenes = fs.readdirSync(path.join(__dirname, "../dbimages2/"));

        res.render("carrito", {
          data: datos,
          imagenes,
        });
      }
    );
  });
};

controller.NoStock = (req, res) => {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario WHERE cantidad = 0", (err, datos) => {
      if (err) {
        console.log(err);
      }
      let imagenes = fs.readdirSync(path.join(__dirname, "../dbimages/"));

      res.render("stock", {
        data: datos,
        imagenes,
      });
    });
  });
};

controller.actualizar = (req, res) => {
  let id = req.params.id;
  let producto = req.body.producto;
  let descripcion = req.body.descripcion;
  let precio = req.body.precio;
  let cantidad = req.body.cantidad;
  let accion = "EDITADO";

  req.getConnection((err, conn) => {
    conn.query("INSERT INTO control (producto, administrador, accion) VALUES(?,?,?)",
    [producto, req.cookies.user, accion], (err, datos) => {
      if(err){
        console.log(err)
      }
      else{
        console.log(datos);
      }
    });
  })


  req.getConnection((err, conn) => {
    conn.query(
      "UPDATE inventario set producto = ?, descripcion = ?, precio = ?, cantidad = ? WHERE id = ?",
      [producto, descripcion, precio, cantidad, id],
      (err, datos) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/admin");
      }
    );
  });
};

controller.compra = (req, res) => {
  let { preciosTotal, idProducts, cantidadProducts } = req.body;

  let asd = cantidadProducts.split(",");
  let test = idProducts.split(",");

  for (let i = 0; i < test.length; i++) {
    req.getConnection((err, conn) => {
      conn.query(
        "UPDATE inventario set cantidad = cantidad - (?) WHERE id = ?",
        [asd[i], test[i]],
        (err, datos) => {
          if (err) {
            console.log(err);
          }
          console.log(datos);
        }
      );
    });
  }

  req.getConnection((err, conn) => {
    conn.query(
      "INSERT INTO compra (producto, descripcion, precio, cantidad, idProducto, comprador) SELECT producto, descripcion, precio, cantidad, idProducto, comprador FROM carrito WHERE comprador = ?",
      [req.cookies.user], (err, datos) => {
        if(err){
          console.log(err)
        }
        else{
          console.log(datos);
        }
      }
    );
  });

  req.getConnection((err, conn) => {
    conn.query("DELETE FROM carrito WHERE comprador = ?", [req.cookies.user], (err, datos) => {
      if(err){
        console.log(err)
      }
      else{
        console.log(datos);
      }
    });
  })

  res.redirect("/carrito");
};

controller.cerrar = (req, res) => {
  res.clearCookie("user");
  res.clearCookie("producto");
  res.clearCookie("idProducto");
  res.redirect("/");
};

controller.deleteCarrito = (req, res) => {

  let id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query("DELETE FROM carrito WHERE idProducto = ?", [id], (err, datos) => {

      res.redirect("/carrito");
    });
  });  
}

controller.buscar = (req, res) => {
  let busqueda = req.body.buscar;
  let busquedaLower = busqueda.toLowerCase();
  busquedaLower = '%' + busquedaLower + '%';
  
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM inventario WHERE producto LIKE ?", [busquedaLower], (err, datos) => {
      if(err){
        console.log(err)
      }
      else{
        let imagenes = fs.readdirSync(path.join(__dirname, "../dbimages/"));
        res.render('busqueda', {
          data: datos,
          imagenes
        })
      }
    })
  })
}

module.exports = controller;
