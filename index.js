import {AppRegistry} from "react-native";

import "./app/ui/config";

import App from "./App";
import {name as appName} from "./app.json";

AppRegistry.registerComponent(appName, () => App);
