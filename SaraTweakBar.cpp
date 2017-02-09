#include "SaraTweakBar.h"

SaraTweakBar::SaraTweakBar( std::string name ) {
	TwInit( TW_OPENGL, NULL );
	//TwInit( TW_OPENGL_CORE, NULL );

	bar = TwNewBar( name.c_str() );
	barName = name;

	TwWindowSize( global_xRes, global_yRes );

	TwAddVarRW( bar, "CameraDir", TW_TYPE_DIR3F, &global_cameraDirection,
		" label='Camera direction' opened=true help='Cambia punto di vista' " );
	//TwAddButton( bar, "Post Process", NULL, &global_postProcess, "label='Post Process'" );

}


SaraTweakBar::~SaraTweakBar() {
}

void SaraTweakBar::draw() {
	TwDraw();
}

void SaraTweakBar::resize() {
	TwWindowSize( global_xRes, global_yRes );
}