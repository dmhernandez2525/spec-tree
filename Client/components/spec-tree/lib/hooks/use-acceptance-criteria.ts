type AcceptanceCriteriaHook = {
  add: () => void;
  remove: (index: number) => void;
  update: (index: number, value: string) => void;
};

export const useAcceptanceCriteria = (
  acceptanceCriteria: string[],
  updateFeature: (params: {
    field: string;
    newValue: string | string[];
    arrayIndex?: number;
    isArrayItem?: boolean;
  }) => void
): AcceptanceCriteriaHook => {
  const add = () => {
    updateFeature({
      field: 'acceptanceCriteria',
      newValue: '',
      isArrayItem: true,
    });
  };

  const remove = (index: number) => {
    const updatedAcceptanceCriteria = [...acceptanceCriteria];
    updatedAcceptanceCriteria.splice(index, 1);
    updateFeature({
      field: 'acceptanceCriteria',
      newValue: updatedAcceptanceCriteria,
    });
  };

  const update = (index: number, value: string) => {
    updateFeature({
      field: 'acceptanceCriteria',
      newValue: value,
      arrayIndex: index,
    });
  };

  return { add, remove, update };
};
