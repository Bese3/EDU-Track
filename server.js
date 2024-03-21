import express from 'express';
import injectRoutes from "./routes/index.js";

const app = express();
app.use(express.json());


function StartServer() {
    const port = process.env.SERVER_PORT || 5000;
    injectRoutes(app);
    app.listen(port, () => {
        console.log(`server is active on port ${port}`);
    });
}

StartServer();

export default app