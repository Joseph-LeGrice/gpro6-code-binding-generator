using System.Runtime.CompilerServices;

class ManagedClass
{
	//// GENERATED
	[MethodImpl(MethodImplOptions.InternalCall)]
	private extern static void DoAThing(int instanceid, string arg0, int arg1);
	public void DoAThing(string arg0, int arg1)
	{
		DoAThing(InstanceID, arg0, arg1);
	}

	[MethodImplAttribute(MethodImplOptions.InternalCall)]
	public extern static double StaticlyDoAThing(string arg0, char arg1);

	//// GENERATED
}