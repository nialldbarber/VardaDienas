import {use$} from "@legendapp/state/react";

import {favourites$} from "@/app/store/favourites";
import {GroupedNamesAccordion} from "@/app/ui/components/GroupedNamesAccordion";
import {Header} from "@/app/ui/components/Header";
import {Layout} from "@/app/ui/components/layout";

export function FavouritesScreen() {
	const favourites = use$(favourites$.favourites);

	return (
		<Layout withScroll="vertical" header={<Header title="Favourites" />}>
			<GroupedNamesAccordion favourites={favourites} />
		</Layout>
	);
}
