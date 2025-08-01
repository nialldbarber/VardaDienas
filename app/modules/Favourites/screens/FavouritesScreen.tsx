import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import {use$} from "@legendapp/state/react";
import {useNavigation, useRoute} from "@react-navigation/native";
import {Home, Setting2} from "iconsax-react-native";
import React from "react";
import {useTranslation} from "react-i18next";
import {Pressable, type ScrollView} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import {StyleSheet} from "react-native-unistyles";

import {setFavouritesScrollToTop} from "@/app/navigation/components/TabBar";
import {favourites$} from "@/app/store/favourites";
import {haptics$} from "@/app/store/haptics";
import {publicHolidays$} from "@/app/store/publicHolidays";
import {Button} from "@/app/ui/components/Button";
import {GroupedNamesAccordion} from "@/app/ui/components/GroupedNamesAccordion";
import {Header} from "@/app/ui/components/Header";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {Layout} from "@/app/ui/components/layout";
import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";

type FavouritesScreenRef = {
	scrollToTop: () => void;
};

export const FavouritesScreen = React.forwardRef<FavouritesScreenRef>(
	(props, ref) => {
		const {t} = useTranslation();
		const favourites = use$(favourites$.favourites);
		const hapticsEnabled = use$(haptics$.enabled);
		const showPublicHolidays = use$(publicHolidays$.show);
		const navigation = useNavigation();
		const route = useRoute();
		const haptic = hapticToTrigger("impactMedium");
		const infoBottomSheetRef = React.useRef<BottomSheetModal>(null);
		const layoutRef = React.useRef<ScrollView>(null);

		console.log(
			"### FavouritesScreen loaded, showPublicHolidays:",
			showPublicHolidays,
		);
		console.log("### Haptics store value:", haptics$.enabled.get());
		console.log("### Public holidays store value:", publicHolidays$.show.get());

		// Get the highlightName from route params (from notification)
		const highlightName = (route.params as {highlightName?: string})
			?.highlightName;

		React.useImperativeHandle(ref, () => ({
			scrollToTop: () => {
				if (layoutRef.current) {
					layoutRef.current.scrollTo({y: 0, animated: true});
				}
			},
		}));

		React.useEffect(() => {
			const scrollToTop = () => {
				if (layoutRef.current) {
					layoutRef.current.scrollTo({y: 0, animated: true});
				}
			};

			setFavouritesScrollToTop(scrollToTop);

			return () => {
				setFavouritesScrollToTop(() => {});
			};
		}, []);

		const handleNavigateToHome = () => {
			if (hapticsEnabled) {
				haptic.impactMedium();
			}
			navigation.navigate("HomeStack" as never);
		};

		const handleOpenInfo = () => {
			if (hapticsEnabled) {
				haptic.impactMedium();
			}
			infoBottomSheetRef.current?.present();
		};

		const handleContextMenuPress = (e: {
			nativeEvent: {name: string; index: number};
		}) => {
			console.log("### Context menu pressed, haptics enabled:", hapticsEnabled);
			if (hapticsEnabled) {
				haptic.impactMedium();
				console.log("### Haptic feedback triggered");
			}

			const actionName = e.nativeEvent.name;
			const actionIndex = e.nativeEvent.index;

			// Use index-based detection since name might not be reliable
			switch (actionIndex) {
				case 0: // First action - Favourites info
					handleOpenInfo();
					break;
				case 1: // Second action - Show/Hide public holidays
					publicHolidays$.setShow(!showPublicHolidays.show);
					break;
				default:
					break;
			}
		};

		const scrollToPosition = (y: number) => {
			if (layoutRef.current) {
				// Use custom animation for smooth scroll with quick start and soft landing
				layoutRef.current.scrollTo({
					y,
					animated: true,
				});
			}
		};

		// Custom scroll function with quick start and soft landing
		const scrollToPositionWithCustomAnimation = (y: number) => {
			if (layoutRef.current) {
				// Use the built-in scrollTo with animated: true for now
				// This is more reliable than the custom animation approach
				layoutRef.current.scrollTo({
					y,
					animated: true,
				});
			}
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
				<Text variant="header" style={styles.emptyStateTitle}>
					{t("favourites.empty.title")}
				</Text>
				<Text style={styles.emptyStateSubtext}>
					{t("favourites.empty.subtitle")}
				</Text>
				<Button onPress={handleNavigateToHome}>
					<Text style={styles.addButtonText}>
						{t("favourites.empty.button")}
					</Text>
				</Button>
			</View>
		);

		return (
			<View style={styles.container}>
				<Layout
					ref={layoutRef}
					withScroll="vertical"
					header={<Header title={t("favourites.title")} showDate={true} />}
				>
					{favourites.length === 0 ? (
						<EmptyState />
					) : (
						<GroupedNamesAccordion
							favourites={favourites}
							highlightName={highlightName}
							scrollToPosition={scrollToPositionWithCustomAnimation}
						/>
					)}
				</Layout>

				<BottomSheetModal
					ref={infoBottomSheetRef}
					snapPoints={["40%"]}
					enablePanDownToClose
					backdropComponent={renderBackdrop}
				>
					<BottomSheetView style={styles.infoContent}>
						<Text style={styles.infoTitle}>{t("favourites.info.title")}</Text>
						<Text style={styles.infoText}>
							{t("favourites.info.description")}
						</Text>
						<Text style={styles.infoText}>{t("favourites.info.features")}</Text>
						<Text style={styles.infoText} withEmoji>
							{t("favourites.info.notifications")}
						</Text>
					</BottomSheetView>
				</BottomSheetModal>

				<ContextMenu
					actions={[
						{
							title: t("contextMenu.favouritesInfo"),
							systemIcon: "info.circle",
						},
						{
							title: t("contextMenu.showPublicHolidays"),
							systemIcon: "calendar",
						},
					]}
					onPress={handleContextMenuPress}
					style={styles.contextMenuContainer}
					dropdownMenuMode={true}
				>
					<Pressable style={styles.settingsButton}>
						<Setting2 size="20" color={colors.primary} variant="Outline" />
					</Pressable>
				</ContextMenu>
			</View>
		);
	},
);

const styles = StyleSheet.create(({colors, sizes, tokens}, {insets}) => ({
	container: {
		flex: 1,
	},

	settingsButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: tokens.background.primary,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.black,
		boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
	},

	contextMenuContainer: {
		position: "absolute",
		top: insets.top + 60,
		right: sizes["16px"],
		zIndex: 100,
	},

	publicHolidaysStatus: {
		paddingHorizontal: sizes["16px"],
		paddingVertical: sizes["8px"],
		marginBottom: sizes["8px"],
	},

	publicHolidaysText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.primary,
		textAlign: "center",
	},

	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: sizes["32px"],
		paddingVertical: sizes["44px"],
	},
	emptyStateTitle: {
		color: tokens.text.primary,
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
		fontSize: 18,
		fontWeight: "600",
		color: colors.black,
		marginBottom: sizes["16px"],
		textAlign: "center",
	},
	infoText: {
		fontSize: 14,
		color: colors.black,
		lineHeight: 20,
		marginBottom: sizes["12px"],
	},
}));
