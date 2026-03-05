const deps = ['express', 'mongoose', 'multer', 'path', 'fs', 'cors', 'dotenv', 'crypto'];

deps.forEach(dep => {
    try {
        require(dep);
        console.log(`✅ ${dep} loaded successfully`);
    } catch (e) {
        console.log(`❌ ${dep} failed to load:`);
        console.log(e.message);
        if (e.code === 'ERR_REQUIRE_ESM') {
            console.log(`   (This is an ESM module and cannot be required in CommonJS)`);
        }
    }
});
