const express = require('express')

const app = express();
const PORT = 5000;

app.get('/', (req, res) =>{
    res.json({msg: "API works..."})
})

app.listen(PORT, () => {
  console.log(`server running at address http://localhost:${PORT}`);
});
