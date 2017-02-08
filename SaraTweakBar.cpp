#include "SaraTweakBar.h"

SaraTweakBar::SaraTweakBar( std::string name ) {
	TwInit( TW_OPENGL, NULL );
	//TwInit( TW_OPENGL_CORE, NULL );

	bar = TwNewBar( name.c_str() );
	barName = name;

	TwWindowSize( global_xRes, global_yRes );


}


SaraTweakBar::~SaraTweakBar() {
}

void SaraTweakBar::draw() {
	TwDraw();
}

void SaraTweakBar::resize() {
	TwWindowSize( global_xRes, global_yRes );
	std::cout << "Sono in SaraTweakBar::resize()" << std::endl;
}