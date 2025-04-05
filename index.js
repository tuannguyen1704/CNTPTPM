// import thư viện expressJS
import express from "express";
import connect from "./db.js";
import rootRoutes from "./src/routes/rootRoutes.js";
import cors from "cors"; //lib giúp cho BE có thể nhận req từ FE

//khởi tạo ứng dụng express
const app = express();

//sử dụng cors
app.use(cors());

//expose hình và video ra ngoài internet
app.use(express.static("."));

//parse body từ stringg =>JSON
app.use(express.json());

//import rootRoutes
app.use(rootRoutes);

//tạo API
//param 1 :path
//param 2 : callback function
app.get("/welcome", (req, res) => {
  //trả dữ liệu về cho client
  //dùng res
  return res.send("welcome to node48");
});

//lấy information từ request (headers,body,params,query)
//1.params
app.get("/users/:id/:hoTen", (req, res) => {
  //lấy giá trị id từ params
  // const id = req.params.id;
  // lưu ý : define bao nhiêu params thì phải truyền đúng số params đó vào URL
  //define tên params nào thì phải lấy đúng tên đó
  //vd: /users/:id
  // const id = req.params.id;
  const { id } = req.params; //destructuring
  //debug log
  const params = req.params;
  console.log({ params });

  return res.send(`value id:${id}`); // trả về dạng string
});

//2.query
app.get("/get-query", (req, res) => {
  // lấy giá trị từ query
  // lưu ý: method GET và DELETE sẽ không có body
  const query = req.query;

  return res.send({ query }); //trả về dạng JSONJSON
});

//3.lấy information từ header request
//header giúp bảo vệ API
app.get("/get-header", (req, res) => {
  //lấy giá trị header từ request
  const headers = req.headers;
  return res.send({ headers });
});

//get body request
// method POST,PUT mới có body
app.post("/get-body", (req, res) => {
  //lấy giá trị body từ request
  //body sẽ có dạng JSON
  const body = req.body;
  return res.send({ body });
});

//viết API để kết nối tới database
// app.get("/get-users", async (req, res) => {
//   try {
//     const [data] = await connect.query(`
//       SELECT * from users
//     `);

//     //response của query hay là execute là 1 list có 2 phần tử
//     //phần 1 :data
//     //phần 2 :metadata
//     return res.send(data);
//   } catch (error) {
//     return res.send(`Error:${error}`);
//   }
// });

//viết API create user
app.post("/create-user", async (req, res) => {
  try {
    const queryString = `
      INSERT INTO users(full_name,email,pass_word) VALUES 
      (?,?,?)
    `;
    let body = req.body;
    let { full_name, email, pass_word } = body; //destructuring
    //thực thi query
    const [data] = await connect.execute(queryString, [
      full_name,
      email,
      pass_word,
    ]);
    return res.send(data);
  } catch (error) {
    return res.send(`Error:${error}`);
  }
});

//khai báo port mà BE sẽ nghe
const port = 3000;
//param 1:port
//param 2 : callback function
app.listen(port, () => {
  console.log(`BE is running with port ${port}`);
});

//npx sequelize-auto -h localhost -d node48_youtube -u root -x 123456 -p 3307 --dialect mysql -o src/models -l esm
