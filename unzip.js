const fs = require('fs');
const path = require('path');

const extract = require('extract-zip');

const arguments = process.argv;
const folderInPathString = arguments[2];
const folderOutPathString = arguments[3];
const fileRegexString = arguments[4];
const folderNameRegexString = arguments[5];

if (!folderInPathString) {
    throw 'You must provide the folder in path.';
}

if (!folderOutPathString) {
    throw 'You must provide the folder out path.';
}

if (!fileRegexString) {
    throw 'You must provide the file regex.';
}

if (!folderNameRegexString) {
    throw 'You must provide the folder name regex.';
}

const folderIn = path.normalize(folderInPathString);
const folderOut = path.normalize(folderOutPathString);
const fileRegex = new RegExp(fileRegexString);
const folderNameRegex = new RegExp(folderNameRegexString);

if (!fs.existsSync(folderIn)) {
    throw 'Your in folder must exist.';
}

if (!fs.existsSync(folderOut)) {
    throw 'Your out folder must exist.';
}

if (!fs.lstatSync(folderIn).isDirectory()) {
    throw 'Your in folder must be a directory.'
}

if (!fs.lstatSync(folderOut).isDirectory()) {
    throw 'Your out folder must be a directory.'
}

const validFiles = [];

fs.readdirSync(folderIn).forEach(fileIn => {
    if (!fileRegex.test(fileIn)) {
        return;
    }

    validFiles.push(fileIn);
});

let count = 0;
validFiles.forEach(fileIn => {
    const name = fileIn.match(folderNameRegex)[0];
    if (!name) {
        console.error(fileIn);
        throw 'Found a folder without a valid name.';
    }

    const namePath = path.join(folderOut, name);
    if (!fs.existsSync(namePath)) {
        fs.mkdirSync(namePath);
    }

    if (!fs.lstatSync(namePath).isDirectory()) {
        console.error(namePath);
        throw 'Final folder path is not a directory.';
    }

    try {
        const fileInPath = path.join(folderIn, fileIn);
        extract(fileInPath, {dir: namePath}).then(result => {
            count++;
            console.log('Extracted ' + name + ' ' + (Math.round(count / validFiles.length * 1000) / 10) + '%');

            // delete zip
            fs.unlinkSync(fileInPath);
        });
    } catch (error) {
        count++;
        console.error('Failed to extract zip ' + fileIn);
    }
});
