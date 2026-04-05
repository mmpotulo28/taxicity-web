import NewRelic from "newrelic-react-native-agent";

export function initNewRelic(appToken: string) {
if (!appToken) {
return;
}
NewRelic.startAgent(appToken);
}
