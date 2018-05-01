#include "stdafx.h"
#include "NativeClassAPI.h"
#include "Engine/Core/GlobalStaticReferences.h"
#include "NativeClassFolder/NativeClass.h"

void NativeClassAPI::RegisterCalls()
{
	mono_add_internal_call("ManagedClass::DoAThing(int managedInstanceId, string arg0, int arg1)", NativeClassAPI::DoAThing);
	mono_add_internal_call("ManagedClass::StaticlyDoAThing", NativeClassAPI::StaticlyDoAThing);
}

void NativeClassAPI::DoAThing(int managedInstanceId, const char* arg0, int arg1)
{
	ScriptedManager* sm = GlobalStaticReferences::Instance()->GetScriptedManager();
	ClassID nativeClassId = NativeClass::GetTypeID();
	NativeClass* nativeClassInstance = static_cast<NativeClass*>(sm->GetNativeInstance(nativeClassId, managedInstanceId));
	nativeClassInstance->DoAThing(arg0, arg1);
}

double NativeClassAPI::StaticlyDoAThing(const char* arg0, char arg1)
{
	[LOGIC]
}