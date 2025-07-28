import type {BottomSheetModal} from "@gorhom/bottom-sheet";
import {useNavigation} from "@react-navigation/native";
import {FlashList} from "@shopify/flash-list";
import React from "react";
import {useTranslation} from "react-i18next";
import {Pressable, useWindowDimensions} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {StyleSheet} from "react-native-unistyles";

import {vardūs} from "@/app/constants/vardūs.json";
import {FastScrollIndex} from "@/app/modules/Home/components/FastScrollIndex";
import {Search} from "@/app/modules/Home/components/Search";
import {SearchBottomSheet} from "@/app/modules/Home/components/SearchBottomSheet";
import {setHomeScrollToToday} from "@/app/navigation/components/TabBar";
import type {NamesRowScreenNavigationProp} from "@/app/navigation/navigation";
import type {DayData} from "@/app/types";
import {SkiaSpinner} from "@/app/ui/components/SkiaSpinner";
import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";
import {getTodaysIndex} from "@/app/utils/dates";

type VardusItem = DayData;

type SearchResult = {
	day: DayData;
	month: string;
	matchType: "vardi" | "citiVardi";
	matchedName: string;
};

type HomeScreenRef = {
	scrollToToday: () => void;
};

function getFirstDayIndexAfter(
	index: number,
	vardus: (string | VardusItem)[],
): number {
	for (let i = index; i < vardus.length; i++) {
		if (typeof vardus[i] !== "string") {
			return i;
		}
	}
	// fallback to first day if not found
	for (let i = 0; i < vardus.length; i++) {
		if (typeof vardus[i] !== "string") {
			return i;
		}
	}
	return 0;
}

const ITEM_HEIGHT = 70;

function getItemLayout(data: (string | VardusItem)[], index: number) {
	let offset = 0;
	for (let i = 0; i < index; i++) {
		if (typeof data[i] !== "string") {
			offset += ITEM_HEIGHT;
		}
	}
	return {
		length: typeof data[index] === "string" ? 0 : ITEM_HEIGHT,
		offset,
		index,
	};
}

export const HomeScreen = React.forwardRef<HomeScreenRef>((props, ref) => {
	const {t} = useTranslation();
	const bottomSheetRef = React.useRef<BottomSheetModal>(null);
	const flashListRef = React.useRef<FlashList<string | VardusItem>>(null);
	const [currentMonth, setCurrentMonth] = React.useState<string | null>(null);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
	const {navigate} = useNavigation<NamesRowScreenNavigationProp>();
	const {height} = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [loading, setLoading] = React.useState(true); // Restore loader
	const hasScrolledRef = React.useRef(false);

	// Helper function to format names with proper punctuation
	const formatNames = React.useCallback(
		(names: string[]): string => {
			if (names.length === 0) return "";
			if (names.length === 1) return names[0];
			if (names.length === 2)
				return `${names[0]} ${t("common.and")} ${names[1]}`;

			// For 3 or more names, use commas and "and" before the last one
			const allButLast = names.slice(0, -1);
			const last = names[names.length - 1];
			return `${allButLast.join(", ")} ${t("common.and")} ${last}`;
		},
		[t],
	);

	// Expose scrollToToday method via ref
	React.useImperativeHandle(ref, () => ({
		scrollToToday: () => {
			if (flashListRef.current) {
				const todaysIndex = getTodaysIndex(vardūs);
				flashListRef.current.scrollToIndex({
					index: todaysIndex,
					animated: true,
				});
			}
		},
	}));

	// Register the scroll function with the global state
	React.useEffect(() => {
		const scrollToToday = () => {
			if (flashListRef.current) {
				const todaysIndex = getTodaysIndex(vardūs);
				flashListRef.current.scrollToIndex({
					index: todaysIndex,
					animated: true,
				});
			}
		};

		setHomeScrollToToday(scrollToToday);

		// Cleanup when component unmounts
		return () => {
			setHomeScrollToToday(() => {});
		};
	}, []);

	const handleOpenSearch = React.useCallback(() => {
		bottomSheetRef.current?.present();
		console.log("i am expanding ");
	}, []);

	const handleSearchQueryChange = React.useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	React.useEffect(() => {
		if (!searchQuery.trim() || searchQuery.trim().length < 2) {
			setSearchResults([]);
			return;
		}

		const timeoutId = setTimeout(() => {
			const lowercaseQuery = searchQuery.toLowerCase().trim();
			const results: SearchResult[] = [];
			let currentMonthName = "";

			for (const item of vardūs) {
				if (typeof item === "string") {
					currentMonthName = item;
					continue;
				}

				for (const name of item.vardi) {
					if (name.toLowerCase().includes(lowercaseQuery)) {
						results.push({
							day: item,
							month: currentMonthName,
							matchType: "vardi",
							matchedName: name,
						});
					}
				}

				for (const name of item.citiVardi) {
					if (name.toLowerCase().includes(lowercaseQuery)) {
						results.push({
							day: item,
							month: currentMonthName,
							matchType: "citiVardi",
							matchedName: name,
						});
					}
				}

				if (results.length >= 40) break;
			}

			results.sort((a, b) => {
				const aExact = a.matchedName.toLowerCase() === lowercaseQuery;
				const bExact = b.matchedName.toLowerCase() === lowercaseQuery;

				if (aExact && !bExact) return -1;
				if (!aExact && bExact) return 1;

				if (a.matchType === "vardi" && b.matchType === "citiVardi") return -1;
				if (a.matchType === "citiVardi" && b.matchType === "vardi") return 1;

				return 0;
			});

			setSearchResults(results.slice(0, 20));
		}, 300);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [searchQuery]);

	const handleSearchResultPress = React.useCallback(
		(result: SearchResult) => {
			bottomSheetRef.current?.dismiss();
			navigate("NamesRow", {
				data: result.day,
				month: result.month,
				selectedName: result.matchedName,
			});
		},
		[navigate],
	);

	const handleSearchDismiss = React.useCallback(() => {
		setSearchQuery("");
		setSearchResults([]);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const monthIndexMap = React.useMemo(() => {
		return vardūs.reduce<{index: number; name: string}[]>(
			(acc, item, index) => {
				if (typeof item === "string") {
					acc.push({index, name: item});
				}
				return acc;
			},
			[],
		);
	}, [vardūs]);

	const months = React.useMemo(() => {
		return monthIndexMap.map((item) => item.name);
	}, [monthIndexMap]);

	const handleMonthSelect = React.useCallback(
		(monthIndex: number) => {
			const monthInfo = monthIndexMap[monthIndex];
			if (monthInfo && flashListRef.current) {
				flashListRef.current.scrollToIndex({
					index: monthInfo.index,
					animated: true,
				});
			}
		},
		[monthIndexMap],
	);

	const onViewableItemsChanged = React.useCallback(
		({viewableItems}: {viewableItems: Array<{index: number | null}>}) => {
			if (viewableItems.length === 0) return;

			const firstVisibleIndex = viewableItems[0].index;
			if (firstVisibleIndex === null) return;

			for (let i = monthIndexMap.length - 1; i >= 0; i--) {
				if (monthIndexMap[i].index <= firstVisibleIndex) {
					setCurrentMonth(monthIndexMap[i].name);
					break;
				}
			}
		},
		[monthIndexMap],
	);

	const renderItem = React.useCallback(
		({item}: {item: string | VardusItem}) => {
			console.log("Rendering item:", item);
			if (typeof item === "string") return null;
			return (
				<Pressable
					onPress={() =>
						navigate("NamesRow", {
							data: item,
							month: currentMonth,
							selectedName: null,
						})
					}
					style={styles.itemContainer}
				>
					<Text variant="header" style={styles.headerText}>
						{item.diena}
					</Text>
					<View>
						<Text style={styles.vardi}>{formatNames(item.vardi)}</Text>
						<Text style={styles.citiVardi}>{formatNames(item.citiVardi)}</Text>
					</View>
				</Pressable>
			);
		},
		[navigate, currentMonth, formatNames],
	);

	const listContainerHeight = height - insets.top - 120;

	const rawInitialIndex = getTodaysIndex(vardūs);
	const initialScrollIndex =
		typeof vardūs[rawInitialIndex] === "string"
			? getFirstDayIndexAfter(rawInitialIndex, vardūs)
			: rawInitialIndex;

	React.useEffect(() => {
		let isMounted = true;
		async function doScrollHack() {
			if (!hasScrolledRef.current && flashListRef.current) {
				hasScrolledRef.current = true;
				await new Promise((res) => setTimeout(res, 200));
				flashListRef.current.scrollToIndex({index: 0, animated: false});
				await new Promise((res) => setTimeout(res, 200));
				flashListRef.current.scrollToIndex({
					index: initialScrollIndex,
					animated: false,
				});
				await new Promise((res) => setTimeout(res, 200));
				if (isMounted) setLoading(false);
			} else {
				if (isMounted) setLoading(false);
			}
		}
		doScrollHack();
		return () => {
			isMounted = false;
		};
	}, [initialScrollIndex]);

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Search currentMonth={currentMonth} openSearch={handleOpenSearch} />
			</View>
			<View style={styles.contentContainer}>
				<SearchBottomSheet
					ref={bottomSheetRef}
					searchQuery={searchQuery}
					onSearchQueryChange={handleSearchQueryChange}
					searchResults={searchResults}
					onResultPress={handleSearchResultPress}
					onDismiss={handleSearchDismiss}
				/>
				<View style={styles.listContainer}>
					<FlashList
						ref={flashListRef}
						data={vardūs}
						contentContainerStyle={styles.flashListContent}
						renderItem={renderItem}
						keyExtractor={(item, index) => {
							if (typeof item === "string") {
								return `month-${item}`;
							}
							let month = "unknown";
							for (let i = index; i >= 0; i--) {
								const prev = vardūs[i];
								if (typeof prev === "string") {
									month = prev;
									break;
								}
							}

							return `day-${month}-${item.diena}`;
						}}
						showsVerticalScrollIndicator={false}
						estimatedItemSize={ITEM_HEIGHT}
						initialScrollIndex={initialScrollIndex}
						getItemType={(item) =>
							typeof item === "string" ? "header" : "day"
						}
						onViewableItemsChanged={onViewableItemsChanged}
					/>
					<FastScrollIndex
						months={months}
						onMonthSelect={handleMonthSelect}
						containerHeight={listContainerHeight}
					/>
				</View>
			</View>
			{loading && (
				<View style={styles.loadingOverlay}>
					<SkiaSpinner />
				</View>
			)}
		</View>
	);
});

const styles = StyleSheet.create(({colors, sizes, tokens}, rtl) => ({
	container: {
		flex: 1,
		paddingTop: rtl.insets.top,
		backgroundColor: colors.primary,
	},
	headerContainer: {
		zIndex: 100,
		elevation: 2,
	},
	contentContainer: {
		flex: 1,
	},
	listContainer: {
		flex: 1,
		position: "relative",
	},
	flashListContent: {
		paddingHorizontal: 10,
		paddingRight: 45,
		backgroundColor: tokens.background.primary,
	},
	itemContainer: {
		paddingBottom: 10,
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.white,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 9999,
	},
	diena: {
		fontSize: 30,
		fontWeight: "800",
		fontFamily: "Plus Jakarta Sans",
	},
	vardi: {
		fontSize: 18,
		color: colors.primary,
		marginTop: sizes["5px"],
		fontWeight: "700",
		fontFamily: "Plus Jakarta Sans",
	},
	citiVardi: {
		fontSize: 14,
		color: tokens.text.header,
		marginTop: sizes["3px"],
		lineHeight: 20,
	},
	headerText: {
		color: tokens.text.header,
	},
}));
