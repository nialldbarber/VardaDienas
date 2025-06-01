import {FlashList} from "@shopify/flash-list";
import {Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

const DATA = [
	{
		title: "First Item",
	},
	{
		title: "Second Item",
	},
	{
		title: "Third Item",
	},
	{
		title: "Fourth Item",
	},
	{
		title: "Fifth Item",
	},
	{
		title: "Sixth Item",
	},
	{
		title: "Seventh Item",
	},
	{
		title: "Eighth Item",
	},
];

export function FavouritesScreen() {
	return (
		<SafeAreaView>
			<Text>Favourites screen!</Text>
			<View
				style={{
					height: 10,
					width: "100%",
					backgroundColor: "pink",
					borderWidth: 1,
				}}
			/>
			<FlashList
				data={DATA}
				renderItem={({item}) => <Text>{item.title}</Text>}
			/>
			<View style={{height: 10, width: "100%", backgroundColor: "pink"}} />
		</SafeAreaView>
	);
}
