#include "SaraTweakBar.h"

SaraTweakBar::SaraTweakBar( std::string name ) {
	TwInit( TW_OPENGL, NULL );
	//TwInit( TW_OPENGL_CORE, NULL );

	bar = TwNewBar( name.c_str() );
	barName = name;

	TwWindowSize( global_xRes, global_yRes );
	TwDefine( " SaraParams size = '280 120' " );

	//TwAddVarRW( bar, "CameraDir", TW_TYPE_DIR3F, &global_cameraDirection,
	//	" label='Camera direction' opened=true help='Cambia punto di vista' " );
	//TwAddButton( bar, "Post Process", NULL, &global_postProcess, "label='Post Process'" );

	TwAddVarRO( bar, "angleX", TW_TYPE_FLOAT, &global_angle[0], " label='global angleX' " );
	TwAddVarRO( bar, "angleY", TW_TYPE_FLOAT, &global_angle[1], " label='global angleY' " );
	TwAddSeparator( bar, NULL, NULL );
	TwEnumVal shaderNames[] =
	{
		{ 0, "modExp" },
		{ 1, "massive clod" },
		{ 2, "palline" },
		{ 3, "biglia" },
		{ 4, "piloni" }
	};
	TwType shadNames = TwDefineEnum( "ShaderNames", shaderNames, 5 );
	TwAddVarRW( bar, "Shader", shadNames, &global_shaderNumber, " label='Fragment shader' " );

}


SaraTweakBar::~SaraTweakBar() {
}

void SaraTweakBar::draw() {
	TwDraw();
}

void SaraTweakBar::resize() {
	TwWindowSize( global_xRes, global_yRes );
}