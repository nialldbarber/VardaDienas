import {use$} from "@legendapp/state/react";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import {GroupedNamesAccordion} from "@/app/ui/components/GroupedNamesAccordion";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {Layout} from "@/app/ui/components/layout";

export function FavouritesScreen() {
	const favourites = use$(favourites$.favourites);

	return (
		<Layout
			withScroll="vertical"
			header={
				<View style={styles.header}>
					<Text variant="header">Favourites</Text>
				</View>
			}
		>
			<GroupedNamesAccordion favourites={favourites} />
		</Layout>
	);
}

const styles = StyleSheet.create(({sizes}) => ({
	header: {
		paddingHorizontal: sizes["10px"],
		height: 50,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
}));
