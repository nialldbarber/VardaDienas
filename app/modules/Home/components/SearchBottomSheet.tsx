import {
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetModal,
	BottomSheetTextInput,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {BottomSheetModalMethods} from "@gorhom/bottom-sheet/lib/typescript/types";
import {CloseCircle} from "iconsax-react-native";
import React from "react";
import {useTranslation} from "react-i18next";
import {Keyboard, Pressable} from "react-native";
import {StyleSheet, UnistylesRuntime} from "react-native-unistyles";

import {settings$} from "@/app/store/settings";
import type {DayData} from "@/app/types";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";
import {hapticToTrigger} from "@/app/utils/haptics";
import {use$} from "@legendapp/state/react";

type SearchResult = {
	day: DayData;
	month: string;
	matchType: "vardi" | "citiVardi";
	matchedName: string;
};

type Props = {
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	searchResults: SearchResult[];
	onResultPress: (result: SearchResult) => void;
};

export const SearchBottomSheet = React.forwardRef<
	BottomSheetModalMethods,
	Props
>(({searchQuery, onSearchQueryChange, searchResults, onResultPress}, ref) => {
	const {t} = useTranslation();
	const snapPoints = React.useMemo(() => ["35%", "70%"], []);
	const haptic = hapticToTrigger("impactMedium");
	const hapticsEnabled = use$(settings$.haptics);
	const [keyboardHeight, setKeyboardHeight] = React.useState(0);

	// Listen to keyboard events
	React.useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			(e) => {
				setKeyboardHeight(e.endCoordinates.height);
			},
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardHeight(0);
			},
		);

		return () => {
			keyboardDidShowListener?.remove();
			keyboardDidHideListener?.remove();
		};
	}, []);

	// Calculate max content size accounting for keyboard
	const maxContentSize = React.useMemo(() => {
		const screenHeight = UnistylesRuntime.screen.height;
		const bottomInset = UnistylesRuntime.insets.bottom;
		const availableHeight = screenHeight - bottomInset * 2 - keyboardHeight;

		// Ensure we don't go below a minimum height
		return Math.max(availableHeight, 200);
	}, [keyboardHeight]);

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

	const renderSearchResult = React.useCallback(
		({item}: {item: SearchResult}) => (
			<Pressable style={styles.resultItem} onPress={() => onResultPress(item)}>
				<View style={styles.resultContent}>
					<Text style={styles.resultName}>{item.matchedName}</Text>
					<Text style={styles.resultDate}>
						{item.day.diena} {t(`months.${item.month}`)}
					</Text>
					<Text style={styles.resultType}>
						{item.matchType === "vardi"
							? t("home.names")
							: t("home.otherNames")}
					</Text>
				</View>
			</Pressable>
		),
		[onResultPress, t],
	);

	const keyExtractor = React.useCallback(
		(item: SearchResult, index: number) =>
			`${item.month}-${item.day.diena}-${item.matchedName}-${index}`,
		[],
	);

	return (
		<BottomSheetModal
			ref={ref}
			index={0}
			snapPoints={snapPoints}
			backgroundStyle={styles.modal}
			backdropComponent={renderBackdrop}
			maxDynamicContentSize={maxContentSize}
			keyboardBehavior="extend"
			keyboardBlurBehavior="restore"
		>
			<BottomSheetView style={styles.header}>
				<Text style={styles.title}>{t("search.title")}</Text>
				<BottomSheetTextInput
					style={styles.searchInput}
					placeholder={t("search.placeholder")}
					value={searchQuery}
					onChangeText={onSearchQueryChange}
					autoCorrect={false}
					autoCapitalize="words"
				/>
				<Pressable
					onPress={() => {
						onSearchQueryChange("");
						if (hapticsEnabled) {
							haptic.impactMedium();
						}
					}}
					style={styles.closeButton}
				>
					<CloseCircle size="24" variant="Outline" color={colors.primary} />
				</Pressable>
			</BottomSheetView>

			{searchResults.length > 0 ? (
				<BottomSheetFlatList
					data={searchResults}
					renderItem={renderSearchResult}
					keyExtractor={keyExtractor}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.flatListContent}
				/>
			) : searchQuery.length > 0 && searchQuery.length < 2 ? (
				<BottomSheetView style={styles.emptyState}>
					<Text style={styles.emptyStateText}>{t("search.minCharacters")}</Text>
				</BottomSheetView>
			) : searchQuery.length >= 2 ? (
				<BottomSheetView style={styles.noResults}>
					<Text style={styles.noResultsText}>
						{t("search.noResults", {query: searchQuery})}
					</Text>
				</BottomSheetView>
			) : (
				<BottomSheetView style={styles.emptyState}>
					<Text style={styles.emptyStateText}>{t("search.startTyping")}</Text>
				</BottomSheetView>
			)}
		</BottomSheetModal>
	);
});

const styles = StyleSheet.create(({colors, sizes, tokens}) => ({
	modal: {
		backgroundColor: tokens.background.primary,
	},
	header: {
		paddingHorizontal: sizes["16px"],
		paddingTop: sizes["8px"],
		paddingBottom: sizes["8px"],
		backgroundColor: tokens.background.primary,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: tokens.text.primary,
		marginBottom: sizes["16px"],
		textAlign: "center",
	},
	searchInput: {
		position: "relative",
		borderRadius: 8,
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["12px"],
		fontSize: 16,
		backgroundColor: tokens.background.textInput,
		fontFamily: "Plus Jakarta Sans",
		fontWeight: "500",
		color: tokens.text.primary,
	},
	flatListContent: {
		paddingHorizontal: sizes["10px"],
		paddingBottom: sizes["20px"],
	},
	resultItem: {
		paddingVertical: sizes["12px"],
		paddingHorizontal: sizes["16px"],
		borderBottomWidth: 1,
		borderBottomColor: colors.lightGrey,
	},
	resultContent: {
		flexDirection: "column",
	},
	resultName: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.primary,
		marginBottom: sizes["4px"],
	},
	resultDate: {
		fontSize: 14,
		color: colors.grey,
		marginBottom: sizes["2px"],
	},
	resultType: {
		fontSize: 12,
		color: tokens.text.fadedText,
	},
	noResults: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: sizes["16px"],
	},
	noResultsText: {
		fontSize: 16,
		color: tokens.text.fadedText,
		textAlign: "center",
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: sizes["16px"],
	},
	emptyStateText: {
		fontSize: 16,
		color: tokens.text.fadedText,
		textAlign: "center",
	},
	closeButton: {
		position: "absolute",
		right: sizes["16px"],
		bottom: 18,
		paddingRight: sizes["8px"],
	},
}));
