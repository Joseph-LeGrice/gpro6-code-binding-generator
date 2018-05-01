class ManagedClass
{
	//// GENERATED
	[MethodImpl(MethodImplOptions.InternalCall)]
	private extern static void DoAThing(int instanceid, string, int);
	public void DoAThing(string, int)
	{
		DoAThing(InstanceID, string, int);
	}

	[MethodImplAttribute(MethodImplOptions.InternalCall)]
	public extern static double StaticlyDoAThing(string, int);

	//// GENERATED
}