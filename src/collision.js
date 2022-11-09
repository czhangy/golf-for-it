export const isColliding = (obj1, obj2) => {
	let count = 0;
	for (let i = 0; i < 3; i++) {
		if (
			obj1.transform.position[i] - obj1.transform.scale[i] <
				obj2.transform.position[i] + obj2.transform.scale[i] &&
			obj1.transform.position[i] + obj1.transform.scale[i] >
				obj2.transform.position[i] - obj2.transform.scale[i]
		) {
			count++;
		}
	}
	return count === 3;
};
