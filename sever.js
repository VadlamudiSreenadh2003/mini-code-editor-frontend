const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/run", (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  const filePath = path.join(__dirname, "temp.py");
  fs.writeFileSync(filePath, code);

exec(`python "${filePath}"`, { timeout: 5000 }, (err, stdout, stderr) => {
  fs.unlinkSync(filePath); // Clean up
  if (err) {
    return res.json({ output: "", error: stderr || err.message });
  }
  res.json({ output: stdout, error: stderr });
});
;
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
