#include "SaraTweakBar.h"

SaraTweakBar::SaraTweakBar( std::string name ) {
	TwInit( TW_OPENGL, NULL );
	//TwInit( TW_OPENGL_CORE, NULL );

	bar = TwNewBar( name.c_str() );
	barName = name;

	TwWindowSize( SaraGlobal::xRes, SaraGlobal::yRes );
	TwDefine( " SaraParams size = '280 160' " );

	TwEnumVal shaderNames[] = {
		{ 0, "modExp" },
		{ 1, "massive clod" },
		{ 2, "palline" },
		{ 3, "biglia" },
		{ 4, "piloni" },
		{ 5, "hills" },
		{ 6, "gray mandelbulb" },
		{ 7, "scratch" },
		{ 8, "modExpTexture" },
	};
	TwType shadNames = TwDefineEnum( "ShaderNames", shaderNames, 9 );

	//TwAddVarRW( bar, "CameraDir", TW_TYPE_DIR3F, &global_cameraDirection,
	//	" label='Camera direction' opened=true help='Cambia punto di vista' " );
	//TwAddButton( bar, "Post Process", NULL, &global_postProcess, "label='Post Process'" );

	TwAddVarRO( bar, "angleX", TW_TYPE_FLOAT, &SaraGlobal::angle[0], " label='global angleX' " );
	TwAddVarRO( bar, "angleY", TW_TYPE_FLOAT, &SaraGlobal::angle[1], " label='global angleY' " );
	TwAddSeparator( bar, NULL, NULL );

	TwAddVarRW( bar, "Shader", shadNames, &SaraGlobal::shaderNumber, " label='Fragment shader' " );
	TwAddSeparator( bar, NULL, NULL );

	TwAddVarRW( bar, "Postproc", TW_TYPE_BOOLCPP, &SaraGlobal::postProcess, " label='Post Process' " );
	TwAddVarRW( bar, "postProcVar", TW_TYPE_FLOAT, &SaraGlobal::postProcVar, " label='PostProc Var' " );
	TwDefine( " SaraParams/postProcVar  step=0.05 " );

}


SaraTweakBar::~SaraTweakBar() {
}

void SaraTweakBar::draw() {
	TwDraw();
}

void SaraTweakBar::resize() {
	TwWindowSize( SaraGlobal::xRes, SaraGlobal::yRes );
}
