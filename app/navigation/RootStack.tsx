import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createStaticNavigation} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {FavouritesScreen} from "@/app/modules/Favourites/screens/FavouritesScreen";
import {HomeScreen} from "@/app/modules/Home/screens/HomeScreen";
import {NamesRowScreen} from "@/app/modules/Home/screens/NamesRowScreen";
import {SettingsScreen} from "@/app/modules/Settings/screens/SettingsScreen";
import {TabBar} from "@/app/navigation/components/TabBar";

const HomeStack = createNativeStackNavigator({
	screens: {
		Home: HomeScreen,
		NamesRow: NamesRowScreen,
	},
	screenOptions: {
		headerShown: false,
	},
});

const RootStack = createBottomTabNavigator({
	initialRouteName: "HomeStack",
	tabBar: (props) => <TabBar {...props} />,
	screens: {
		HomeStack,
		Favourites: FavouritesScreen,
		Settings: SettingsScreen,
	},
	screenOptions: {
		headerShown: false,
		animation: "shift",
	},
});

export const Navigation = createStaticNavigation(RootStack);
