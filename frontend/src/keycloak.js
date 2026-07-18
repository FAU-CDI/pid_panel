import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "https://auth-staging.data.fau.de",
    realm: "cdi",
    clientId: "local_pid_customer_system",
});

export default keycloak;