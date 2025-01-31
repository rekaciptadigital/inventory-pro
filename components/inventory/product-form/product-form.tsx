// ...existing imports...

export function ProductForm({ defaultValues }: Props) {
  const dispatch = useDispatch();

  // Add effect to initialize form data including unit
  useEffect(() => {
    if (defaultValues) {
      dispatch(
        updateForm({
          ...defaultValues,
          unit: defaultValues.unit || "PC", // Make sure unit is initialized
        })
      );
    }
  }, [defaultValues, dispatch]);

  // ...existing code...
}
