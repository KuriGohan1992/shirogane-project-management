import { TaskRouteModal } from "@/components/modals/task-route-modal";
import { TaskDetailsLoading } from "@/components/task-details-loading";

export default function TaskModalLoading() {
	return (
		<TaskRouteModal taskTitle="Loading task">
			<TaskDetailsLoading />
		</TaskRouteModal>
	);
}
