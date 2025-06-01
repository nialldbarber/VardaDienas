import {type StaticScreenProps, useNavigation} from "@react-navigation/native";
import {Pressable, Text, View} from "react-native";

import type {DayData} from "@/app/types";
import {Layout} from "@/app/ui/components/layout";

type Props = StaticScreenProps<{
	data: DayData;
}>;

export function NamesRowScreen({route}: Props) {
	const {goBack} = useNavigation();

	return (
		<Layout>
			<Pressable>
				<Text onPress={() => goBack()} style={{fontSize: 20, color: "blue"}}>
					Go Back
				</Text>
			</Pressable>
			<Text>Names Row screen!</Text>
			<View
				style={{
					height: 10,
					width: "100%",
					backgroundColor: "pink",
					borderWidth: 1,
				}}
			/>
			<Text style={{fontSize: 24, fontWeight: "bold"}}>
				{JSON.stringify(route.params.data)}
			</Text>
		</Layout>
	);
}
