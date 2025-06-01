import type {StaticParamList} from "@react-navigation/native";
import type {NativeStackNavigationProp} from "@react-navigation/native-stack";

export type HomeStackParamList = StaticParamList<typeof HomeStack>;
export type NamesRowScreenNavigationProp = NativeStackNavigationProp<
	HomeStackParamList,
	"NamesRow"
>;

export type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
