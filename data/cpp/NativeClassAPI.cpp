#include "stdafx.h"
#include "Engine/Core/GlobalStaticReferences.h"
#include "NativeClassFolder/NativeClass.h"

void NativeClassAPI::RegisterCalls()
{
	mono_add_internal_call("ManagedClass::DoAThing(int,string, int)", NativeClassAPI::DoAThing);
	mono_add_internal_call("ManagedClass::StaticlyDoAThing", NativeClass::StaticlyDoAThing);
}

void NativeClassAPI::DoAThing(int managedInstanceId, const char*, int)
{
	ScriptedManager* sm = GlobalStaticReferences::Instance()->GetScriptedManager();
	ClassID nativeClassId = NativeClass::GetTypeID();
	NativeClass* nativeClassInstance = sm->GetNativeInstance(nativeClassId, managedInstanceId);
	nativeClassInstance->DoAThing(const char*, int);
}

double NativeClass::StaticlyDoAThing(const char*, int)
{
	[LOGIC]
}