var http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT;
app.listen(port)

const baseDir = `${process.env.DIR_NAME}/build/`
app.use(express.static(`${baseDir}`))
app.get('/', (req, res) => res.sendfile('index.html', { root: baseDir }))