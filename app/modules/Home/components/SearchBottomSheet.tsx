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
import {Pressable} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import type {DayData} from "@/app/types";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {colors} from "@/app/ui/config/colors";

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
	const snapPoints = React.useMemo(() => ["35%", "70%"], []);

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
						{item.day.diena} {item.month}
					</Text>
					<Text style={styles.resultType}>
						{item.matchType === "vardi" ? "Galvenie vārdi" : "Citi vārdi"}
					</Text>
				</View>
			</Pressable>
		),
		[onResultPress],
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
			detached
			backdropComponent={renderBackdrop}
		>
			<BottomSheetView style={styles.header}>
				<Text style={styles.title}>Meklēt vārdus</Text>
				<BottomSheetTextInput
					style={styles.searchInput}
					placeholder="Ierakstiet vārdu..."
					value={searchQuery}
					onChangeText={onSearchQueryChange}
					autoCorrect={false}
					autoCapitalize="words"
				/>
				<Pressable
					onPress={() => onSearchQueryChange("")}
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
					<Text style={styles.emptyStateText}>
						Ierakstiet vismaz 2 simbolus, lai meklētu
					</Text>
				</BottomSheetView>
			) : searchQuery.length >= 2 ? (
				<BottomSheetView style={styles.noResults}>
					<Text style={styles.noResultsText}>
						Nav atrasts neviens vārds ar "{searchQuery}"
					</Text>
				</BottomSheetView>
			) : (
				<BottomSheetView style={styles.emptyState}>
					<Text style={styles.emptyStateText}>
						Sāciet rakstīt, lai meklētu vārdus
					</Text>
				</BottomSheetView>
			)}
		</BottomSheetModal>
	);
});

const styles = StyleSheet.create(({colors, sizes}) => ({
	header: {
		paddingHorizontal: sizes["16px"],
		paddingTop: sizes["8px"],
		paddingBottom: sizes["8px"],
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: colors.black,
		marginBottom: sizes["16px"],
		textAlign: "center",
	},
	searchInput: {
		position: "relative",
		borderRadius: 8,
		paddingHorizontal: sizes["12px"],
		paddingVertical: sizes["12px"],
		fontSize: 16,
		backgroundColor: colors.grey1,
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
		color: colors.black,
		marginBottom: sizes["2px"],
	},
	resultType: {
		fontSize: 12,
		color: colors.grey,
	},
	noResults: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: sizes["16px"],
	},
	noResultsText: {
		fontSize: 16,
		color: colors.grey,
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
		color: colors.grey,
		textAlign: "center",
	},
	closeButton: {
		position: "absolute",
		right: sizes["16px"],
		bottom: sizes["16px"],
		paddingRight: sizes["8px"],
	},
}));
