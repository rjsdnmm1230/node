const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect('mongodb+srv://rjsdnmm1230:1234@cluster0.rzo2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
  console.error("몽고디비 연결 에러", err);
});

module.exports = connect;