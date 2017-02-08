#pragma once
#include <string>
#include <AntTweakBar.h>

#include "Sara.h"

class SaraTweakBar {
public:
	SaraTweakBar( std::string name );
	~SaraTweakBar();

	void draw();
	void resize();

private:
	TwBar		*	bar;
	std::string		barName;
};