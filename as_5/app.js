const express = require('express');
const path = require('path');
const acc = require('./db/MenuItemAccessor');
const { Constants } = require('./utils/Constants');
const { MenuItem } = require('./entity/MenuItem');
const app = express();

app.use(express.static(Constants.PUBLIC_FOLDER));

app.use(express.json());



app.get('/api/menuitems', async function (request, responce) {
  try {
    let data = await acc.getAllItems();
    responce.status(200).json({ err: null, data: data });
  } catch (err) {
    responce.status(500).json({ err: 'could not read data' + err, data: null });
  }
});


app.put("/api/menuitems/:id(\\d{3})", async (request, response) => {
  let item;

  try {
      let menuItem = request.body;

      item = new MenuItem(
        menuItem.id,
        menuItem.category,
        menuItem.description,
        menuItem.price,
        menuItem.vegetarian,
      );
  } catch (err) {
      response
          .status(400)
          .json({ err: "MenuItem constructor error " + err, data: null });
      return;
  }

  try {
      let ok = await acc.updateItem(item);
      if (ok) {
          response.status(200).json({ err: null, data: true });
      } else {
          response
              .status(404)
              .json({ err: `item ${item.id} does not exist`, data: null });
      }
  } catch (err) {
      response.status(500).json({ err: "update aborted" + err, data: null });
  }
});

app.post("/api/menuitems/:id(\\d{3})", async (request, response) =>{
  let item;
  try {
    let menuItem = request.body;
      item = new MenuItem(
        menuItem.id,
        menuItem.category,
        menuItem.description,
        menuItem.price,
        menuItem.vegetarian,
      );
  }catch (err){
    response
          .status(400)
          .json({ err: "MenuItem constructor error " + err, data: null });
      return;
  }
  try {
    let ok = await acc.addItem(item);
    if (ok) {
        response.status(201).json({ err: null, data: true });
    } else {
        response
            .status(409)
            .json({ err: `item ${item.id} already exists`, data: null });
    }
  } catch (err) {
    response.status(500).json({ err: "update aborted" + err, data: null });
  }
})

app.delete("/api/menuitems/:id(\\d{3})",async (request, response)=>{
  let item;
  let id;
  try {
    id = parseInt(request.url.substring(request.url.length-3));
    item = await acc.getItemByID(id);
    console.log(item);
    if(item != null ){
      let ok = await acc.deleteItem(item);
      if (ok) {
          response.status(200).json({ err: null, data: true });
      } else {
          response
              .status(404)
              .json({ err: `item ${id} does not exist`, data: null });
      }
    }else{
      response
        .status(404)
        .json({ err: `item ${id} does not exist`, data: null });
    }
  } catch (err) {
      response.status(500).json({ err: "Delete aborted " + err, data: null });
  }
})

//*** Invalid URLs ***//

app.get("/api/menuitems/:id(\\d{3})", function (request, response) {
  response.status(405).json({ err: "Single GETs not supported", data: null });
});
app.put("/api/menuitems", function (request, response) {
  response
      .status(405)
      .json({ err: "Bulk updates not supported", data: null });
});
app.post("/api/menuitems", function (request, response) {
  response
      .status(405)
      .json({ err: "Bulk inserts not supported", data: null });
});
app.delete("/api/menuitems", function (request, response) {
  response
      .status(405)
      .json({ err: "Bulk deletes not supported", data: null });
});


//Default
app.use(function (request, response) {
  response
        .status(404)
        .sendFile(path.join(__dirname, Constants.PUBLIC_FOLDER, "404.html"));
});

//kenzie
app.listen(Constants.PORT_NUM, () =>
    console.log(`Example app listening on port ${Constants.PORT_NUM}!`)
);