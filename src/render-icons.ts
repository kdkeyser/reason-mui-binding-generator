import * as Fs from 'fs';
import * as Path from 'path';
import * as rimraf from 'rimraf';

const outputDirectory = Path.join(__dirname, '../', 'output-icons');

if (Fs.existsSync(Path.join(outputDirectory, 'reason'))) {
    rimraf.sync(Path.join(outputDirectory, 'reason'));
}
Fs.mkdirSync(Path.join(outputDirectory, 'reason'));

function GenerateBinding(iconName : string): string {
    return `
[@bs.module "@material-ui/icons/${iconName}"]
external reactClass: ReasonReact.reactClass = "default";

let make = () =>
    ReasonReact.wrapJsForReason(
        ~reactClass,
        ~props,
        ~children
    );`
}

const GetIcons = () => {
    Fs.readdir("./extract/icons", function( err, files) {
        if (err) {
	    console.error("Could not find icon sources", err);
            process.exit(1);
    }
    
    files.forEach( function(file, i) {
        var extension = Path.extname(file)
        var filename = Path.basename(file,extension)
        if (extension == ".js") {
            var filenameReason = Path.join(outputDirectory,'reason', `${filename}.re`)
            Fs.writeFileSync(filenameReason,GenerateBinding(filename))
        }
    });
});
};

GetIcons();
