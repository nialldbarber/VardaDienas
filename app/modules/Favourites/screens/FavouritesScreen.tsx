import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import {use$} from "@legendapp/state/react";
import {useNavigation} from "@react-navigation/native";
import {Home, InfoCircle} from "iconsax-react-native";
import React from "react";
import {Pressable} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {favourites$} from "@/app/store/favourites";
import {GroupedNamesAccordion} from "@/app/ui/components/GroupedNamesAccordion";
import {Header} from "@/app/ui/components/Header";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {Layout} from "@/app/ui/components/layout";
import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";

export function FavouritesScreen() {
	const favourites = use$(favourites$.favourites);
	const navigation = useNavigation();
	const haptic = hapticToTrigger("impactMedium");
	const infoBottomSheetRef = React.useRef<BottomSheetModal>(null);

	const handleNavigateToHome = () => {
		haptic.impactMedium();
		navigation.navigate("HomeStack" as never);
	};

	const handleOpenInfo = () => {
		haptic.impactMedium();
		infoBottomSheetRef.current?.present();
		console.log("Info button pressed");
	};

	const renderBackdrop = React.useCallback(
		(props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
			/>
		),
		[],
	);

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
		<View style={styles.container}>
			<Layout withScroll="vertical" header={<Header title="Mīļākie" />}>
				{favourites.length === 0 ? (
					<EmptyState />
				) : (
					<GroupedNamesAccordion favourites={favourites} />
				)}
			</Layout>

			<Pressable onPress={handleOpenInfo} style={styles.infoButton}>
				<InfoCircle size="20" color={colors.primary} variant="Outline" />
			</Pressable>

			<BottomSheetModal
				ref={infoBottomSheetRef}
				snapPoints={["40%"]}
				enablePanDownToClose
				backdropComponent={renderBackdrop}
			>
				<BottomSheetView style={styles.infoContent}>
					<Text style={styles.infoTitle}>Par mīļāko sadaļu</Text>
					<Text style={styles.infoText}>
						Šeit jūs varat apskatīt visus savus iecienītākos vārdus, kas ir
						sakārtoti pēc mēnešiem un dienām.
					</Text>
					<Text style={styles.infoText}>
						Katram vārdam jūs varat:
						{"\n"}• Pievienot vai noņemt no izlases
						{"\n"}• Ieslēgt vai izslēgt paziņojumus vārda dienai
					</Text>
					<Text style={styles.infoText}>
						Paziņojumi tiks nosūtīti vārda dienas rītā, lai atgādinātu par
						svarīgo dienu.
					</Text>
				</BottomSheetView>
			</BottomSheetModal>
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes, tokens}, {insets}) => ({
	container: {
		flex: 1,
	},
	infoButton: {
		position: "absolute",
		top: insets.top + 60,
		right: sizes["16px"],
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: tokens.background.primary,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
		shadowColor: colors.black,
		boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: sizes["32px"],
		paddingVertical: sizes["44px"],
	},
	emptyStateTitle: {
		fontWeight: "600",
		color: colors.black,
		textAlign: "center",
		marginTop: sizes["24px"],
		marginBottom: sizes["12px"],
	},
	emptyStateSubtext: {
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
	infoContent: {
		paddingHorizontal: sizes["20px"],
		paddingTop: sizes["16px"],
		paddingBottom: sizes["42px"],
	},
	infoTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: colors.black,
		marginBottom: sizes["16px"],
		textAlign: "center",
	},
	infoText: {
		color: colors.black,
		lineHeight: 24,
		marginBottom: sizes["12px"],
	},
}));
