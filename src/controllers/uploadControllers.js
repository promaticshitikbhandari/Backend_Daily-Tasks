

const uploadFile = async (req, res) => {
    const {file} = req.files;

    if(!file) return res.status(400).json({success: false, message: "File is Required"});
    const filePath = file.map( (elem) => elem.path.replace("public", ""));

    return res.status(202).json({
        success: true,
        message: "File is Uploaded",
        data: filePath
    })

}

export default uploadFile