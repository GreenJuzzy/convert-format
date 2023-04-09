var fs = require("fs");
var PATH = require("path");

var time = new Date()
var filesConverted = 0

var fileTypes = ["ts", "js", "mcfunction", "mcstructure", "txt", "json"]


if (!fs.existsSync(__dirname + "\\output")) fs.mkdirSync(__dirname + "\\output")

var lookInFolder = async (path = `${__dirname}\\input`) => {
    var entries = fs.readdirSync(path, { withFileTypes: true });

    var folders = entries.filter(file => file.isDirectory());
    var files = entries.filter(file => file.isFile()).filter(file => fileTypes.some((type) => file.name.endsWith(type)) == true);


    folders.forEach((folder) => {
        try {
            fs.mkdirSync(`${path.replace("input", "output")}\\${folder.name}`)
        } catch (e) { }

        lookInFolder(PATH.join(path, folder.name));
    });


    for (let i = 0; i < files.length; i++) {
        var fileName = files[i].name
        var fileData = fs.readFileSync(`${path}\\${fileName}`, "utf8")


        var converted = await convert(fileData)
        filesConverted++

        fs.writeFileSync(`${path.replace("input", "output")}\\${fileName}`, converted)


    }
};

var convert = async (data) => new Promise((resolve, reject) => {
    data = data.split("\n")

    data.forEach((line, lineNumber) => {
        var matching = line.match(/execute\s(@s|@e|@r|@p|@a|@selector)(((\[.*?)\])?)(~| ~|){3}/g)
        if (!matching) return;

        matching.forEach((value, matchNumber) => {
            var selector = value.match(/(@s|@e|@r|@p|@a)/)[0]
            var options = value.match(/\[.*?\]/g)


            data[lineNumber] = data[lineNumber].replace(value, `execute as ${selector}${options ?? ""} run`)
        })
    })

    resolve(data.join("\n"))

})

lookInFolder().then(() => {
    console.log(`Converted ${filesConverted} files in ${new Date() - time}ms`)
})