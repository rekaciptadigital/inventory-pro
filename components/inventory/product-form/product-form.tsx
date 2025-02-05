// ...existing imports...

export function ProductForm({ defaultValues }: Props) {
  const dispatch = useDispatch();

  // Reset form state when switching products
  useEffect(() => {
    dispatch(resetCategories());
    
    if (defaultValues) {
      dispatch(updateForm({
        ...defaultValues,
        unit: defaultValues.unit || "PC",
      }));
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(resetCategories());
    };
  }, [defaultValues?.id, dispatch]); // Add id to dependencies

  // ...existing code...
}
