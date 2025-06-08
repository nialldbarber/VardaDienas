import {use$} from "@legendapp/state/react";
import {useNavigation} from "@react-navigation/native";
import {Home} from "iconsax-react-native";
import {Pressable} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import {GroupedNamesAccordion} from "@/app/ui/components/GroupedNamesAccordion";
import {Header} from "@/app/ui/components/Header";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {Layout} from "@/app/ui/components/layout";
import {hapticToTrigger} from "@/app/utils/haptics";

export function FavouritesScreen() {
	const favourites = use$(favourites$.favourites);
	const navigation = useNavigation();
	const haptic = hapticToTrigger("impactMedium");

	const handleNavigateToHome = () => {
		haptic.impactMedium();
		navigation.navigate("HomeStack" as never);
	};

	const EmptyState = () => (
		<View style={styles.emptyState}>
			<Home size="64" color="#E5E5E5" variant="Outline" />
			<Text style={styles.emptyStateTitle}>Hmm, vārdi vēl nav pievienoti!</Text>
			<Text style={styles.emptyStateSubtext}>
				Atklājiet vārdu dienas un pievienojiet savus mīļākos, lai redzētu tos
				šeit
			</Text>
			<Pressable style={styles.addButton} onPress={handleNavigateToHome}>
				<Text style={styles.addButtonText}>Pārlūkot vārdus</Text>
			</Pressable>
		</View>
	);

	return (
		<Layout withScroll="vertical" header={<Header title="Mīļākie" />}>
			{favourites.length === 0 ? (
				<EmptyState />
			) : (
				<GroupedNamesAccordion favourites={favourites} />
			)}
		</Layout>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: sizes["32px"],
		paddingVertical: sizes["44px"],
	},
	emptyStateTitle: {
		fontSize: 24,
		fontWeight: "600",
		color: colors.black,
		textAlign: "center",
		marginTop: sizes["24px"],
		marginBottom: sizes["12px"],
	},
	emptyStateSubtext: {
		fontSize: 16,
		color: colors.grey,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: sizes["32px"],
	},
	addButton: {
		backgroundColor: colors.primary,
		paddingHorizontal: sizes["24px"],
		paddingVertical: sizes["12px"],
		borderRadius: 8,
	},
	addButtonText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: "600",
	},
}));
