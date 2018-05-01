#pragma once

#pragma warning(push)
#pragma warning(disable:4201)
#include <mono/metadata/object.h>
#pragma warning(pop)

class NativeClassAPI
{
	static void RegisterCalls();
	static void DoAThing(int managedInstanceId, const char* arg0, int arg1);
	static double StaticlyDoAThing(const char* arg0, char arg1);
}