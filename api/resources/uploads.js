//Handlers Multipart-form
const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation

    const upload = multer({
        dest: "C:\\uploads\\"
    });

    const save = (req, res) => {
        const tempPath = req.file.path;
        const targetPath ="C:\\uploads\\"+req.file.originalname;// path.join(__dirname, 

        if (path.extname(req.file.originalname).toLowerCase() === ".png") {
            fs.rename(tempPath, targetPath, err => {
                if (err) return handleError(err, res);

                res
                .status(200)
                .contentType("text/plain")
                .end(targetPath);
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) return handleError(err, res);

                res
                .status(403)
                .contentType("text/plain")
                .end("Only .png files are allowed!");
            });
        }
    }

    const handleError = (err, res) => {
        res
          .status(500)
          .contentType("text/plain")
          .end("Oops! Something went wrong! " + err);
    };

    return { save, upload}
}