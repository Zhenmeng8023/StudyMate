import { createApp } from "vue";
import "@studymate/ui/tokens.css";
import App from "./App.vue";
import { createAdminAppRouter } from "./router/appRouter";

const app = createApp(App);

app.use(createAdminAppRouter());
app.mount("#app");
