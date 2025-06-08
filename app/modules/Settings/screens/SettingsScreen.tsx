import {Header} from "@/app/ui/components/Header";
import {Text} from "@/app/ui/components/Text";
import {Layout} from "@/app/ui/components/layout";

export function SettingsScreen() {
	return (
		<Layout header={<Header title="Settings" />}>
			<Text>Settings Screen</Text>
		</Layout>
	);
}
