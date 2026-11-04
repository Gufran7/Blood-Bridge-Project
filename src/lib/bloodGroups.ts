export const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const CAN_DONATE_TO: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

function invertCompatibility(
  donateTo: Record<BloodGroup, BloodGroup[]>,
): Record<BloodGroup, BloodGroup[]> {
  return BLOOD_GROUPS.reduce(
    (acc, recipient) => {
      acc[recipient] = BLOOD_GROUPS.filter((donor) => donateTo[donor].includes(recipient));
      return acc;
    },
    {} as Record<BloodGroup, BloodGroup[]>,
  );
}

export const CAN_RECEIVE_FROM = invertCompatibility(CAN_DONATE_TO);
