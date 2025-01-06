import { Args, Info, Int, Query, Resolver } from "@nestjs/graphql";
import { Dm, DmMessage } from "@/dm/dm.graphql";
import { DmService } from "@/dm/dm.service";
import { Self } from "@/self.decorator";
import { UserEntity } from "@/user/user.entity";
import { FieldNode, GraphQLResolveInfo, SelectionNode } from "graphql";

@Resolver(() => Dm)
export class DmResolver {
	constructor(private readonly dmService: DmService) {}

	@Query(() => [DmMessage], { name: "dmMessages" })
	getDmMessages(
		@Self() self: UserEntity,
		@Args("dmId") dmId: string,
		@Args("last", { type: () => String, nullable: true }) last: string | undefined,
		@Args("take", { type: () => Int }) take: number,
		@Info() info: GraphQLResolveInfo,
	): Promise<DmMessage[]> {
		this.test(info);
		return this.dmService.getMessagesForDm(self, dmId, last ?? null, take);
	}

	test(info: GraphQLResolveInfo) {
		function collectRequestedFields(node: FieldNode, collector: string[], path: string[]) {
			if (node.selectionSet) {
				node.selectionSet.selections.forEach((subNode) => {
					collectRequestedFields(subNode as FieldNode, collector, [...path, node.name.value]);
				});
			} else if (!node.name.value.startsWith("__")) {
				collector.push([...path, node.name.value].join("."));
			}
		}

		const arr: string[] = [];
		info.fieldNodes.forEach((node) => collectRequestedFields(node, arr, []));
		console.log(arr);
	}
}
