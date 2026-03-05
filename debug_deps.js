try {
    console.log("Testing express...");
    require('express');
    console.log("Express OK");

    console.log("Testing mongoose...");
    require('mongoose');
    console.log("Mongoose OK");

    console.log("Testing multer...");
    require('multer');
    console.log("Multer OK");

    console.log("Testing nanoid...");
    require('nanoid');
    console.log("Nanoid OK");

    console.log("Testing dotenv...");
    require('dotenv');
    console.log("Dotenv OK");

    console.log("Testing cors...");
    require('cors');
    console.log("Cors OK");

} catch (e) {
    console.error("FAILED on dependency requirement:");
    console.error(e);
    process.exit(1);
}
