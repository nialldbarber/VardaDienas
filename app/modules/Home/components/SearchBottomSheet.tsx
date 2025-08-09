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
import {StyleSheet} from "react-native-unistyles";

import {haptics$} from "@/app/store/haptics";
import type {DayData} from "@/app/types";
import {Pressable} from "@/app/ui/components/Pressable";
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
	onDismiss?: () => void;
};

export const SearchBottomSheet = React.forwardRef<
	BottomSheetModalMethods,
	Props
>(
	(
		{searchQuery, onSearchQueryChange, searchResults, onResultPress, onDismiss},
		ref,
	) => {
		const {t} = useTranslation();
		const snapPoints = React.useMemo(() => ["25%", "50%"], []);
		const haptic = hapticToTrigger("impactMedium");
		const hapticsEnabled = use$(haptics$.enabled);

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
				<Pressable
					animateStyle="opacity"
					style={styles.resultItem}
					onPress={() => {
						// Add a small delay to ensure keyboard dismissal doesn't interfere
						setTimeout(() => {
							onResultPress(item);
						}, 50);
					}}
				>
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
				onDismiss={onDismiss}
				enableDynamicSizing
			>
				<BottomSheetView style={styles.header}>
					<Text style={styles.title}>{t("search.title")}</Text>
					<View style={styles.searchContainer}>
						<BottomSheetTextInput
							style={styles.searchInput}
							placeholder={t("search.placeholder")}
							value={searchQuery}
							onChangeText={onSearchQueryChange}
							autoCorrect={false}
							autoCapitalize="words"
							blurOnSubmit={false}
							returnKeyType="search"
						/>
						<Pressable
							onPress={() => {
								onSearchQueryChange("");
								haptic.impactMedium();
							}}
						>
							<CloseCircle size="28" variant="Bold" color={colors.primary} />
						</Pressable>
					</View>
				</BottomSheetView>

				{searchResults.length > 0 ? (
					<BottomSheetFlatList
						data={searchResults}
						renderItem={renderSearchResult}
						keyExtractor={keyExtractor}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.flatListContent}
						keyboardShouldPersistTaps="handled"
					/>
				) : searchQuery.length > 0 && searchQuery.length < 2 ? (
					<BottomSheetView style={styles.emptyState}>
						<Text style={styles.emptyStateText}>
							{t("search.minCharacters")}
						</Text>
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
	},
);

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
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: sizes["16px"],
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		color: tokens.text.primary,
		marginBottom: sizes["16px"],
		textAlign: "center",
	},
	searchInput: {
		flex: 1,
		borderRadius: 8,
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["12px"],
		fontSize: 16,
		backgroundColor: tokens.background.textInput,
		fontFamily: "Plus Jakarta Sans",
		fontWeight: "600",
		color: tokens.text.primary,
		marginRight: sizes["8px"],
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
		fontWeight: "700",
		color: colors.primary,
		marginBottom: sizes["4px"],
	},
	resultDate: {
		fontSize: 14,
		color: tokens.text.fadedText,
		fontWeight: "600",
		marginBottom: sizes["2px"],
	},
	resultType: {
		fontSize: 12,
		fontWeight: "600",
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
		fontWeight: "600",
		textAlign: "center",
	},
}));
