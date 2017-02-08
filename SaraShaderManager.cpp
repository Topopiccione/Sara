#include "SaraShaderManager.h"

SaraShaderManager::SaraShaderManager( std::string vertShaderFilename, std::string fragmShaderFilename ) :
			vertexShaderFilename( vertShaderFilename),
			fragmentShaderFilename( fragmShaderFilename ) {

	vertexShaderSource = filetobuf( vertexShaderFilename.c_str() );
	fragmentShaderSource = filetobuf( fragmentShaderFilename.c_str() );

	GLint isLinked = 0;
#ifdef DEBUG_MAIN_SHADERS	
	int IsCompiled_VS, IsCompiled_FS, IsLinked, maxLength;
	char *vertexInfoLog;
	vertshad = glCreateShader( GL_VERTEX_SHADER );
	glShaderSource( vertshad, 1, &vertexShader_source, 0 );
	glCompileShader( vertshad );
	glGetShaderiv( vertshad, GL_COMPILE_STATUS, &IsCompiled_VS );
	if (IsCompiled_VS == FALSE)
	{
		glGetShaderiv( vertshad, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetShaderInfoLog( vertshad, maxLength, &maxLength, vertexInfoLog );
		free( vertexInfoLog );
		return;
	}

	fragshad = glCreateShader( GL_FRAGMENT_SHADER );
	glShaderSource( fragshad, 1, &yuvShader_source, 0 );
	glCompileShader( fragshad );
	glGetShaderiv( fragshad, GL_COMPILE_STATUS, &IsCompiled_FS );
	if (IsCompiled_FS == FALSE)
	{
		glGetShaderiv( fragshad, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetShaderInfoLog( fragshad, maxLength, &maxLength, vertexInfoLog );
		free( vertexInfoLog );
		return;
	}

	shdprog = glCreateProgram();
	glAttachShader( shdprog, vertshad );
	glAttachShader( shdprog, fragshad );
	glLinkProgram( shdprog );
	glGetProgramiv( shdprog, GL_LINK_STATUS, &IsLinked );
	if (!IsLinked) {
		glGetProgramiv( shdprog, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( shdprog, maxLength, NULL, vertexInfoLog );
	}

	glDeleteShader( vertshad );
	glDeleteShader( fragshad );
#else	
	vertexShaderProgram = glCreateShaderProgramv( GL_VERTEX_SHADER, 1, &vertexShaderSource );
	glGetProgramiv( vertexShaderProgram, GL_LINK_STATUS, &isLinked );
	if (isLinked == GL_FALSE) {
		int maxLength;
		char *vertexInfoLog;
		std::cout << "Vertex shader compile failed" << std::endl;
		glGetProgramiv( vertexShaderProgram, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( vertexShaderProgram, maxLength, &maxLength, vertexInfoLog );
		std::cout << vertexInfoLog << std::endl;
		free( vertexInfoLog );
		return;
	}
	else {
		std::cout << "Vertex shader successfully compiled" << std::endl;
	}

	fragmentShaderProgram = glCreateShaderProgramv( GL_FRAGMENT_SHADER, 1, &fragmentShaderSource );
	glGetProgramiv( fragmentShaderProgram, GL_LINK_STATUS, &isLinked );
	if (isLinked == GL_FALSE) {
		int maxLength;
		char *vertexInfoLog;
		std::cout << "Shader compile failed" << std::endl;
		glGetProgramiv( fragmentShaderProgram, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( fragmentShaderProgram, maxLength, &maxLength, vertexInfoLog );
		std::cout << vertexInfoLog << std::endl;
		free( vertexInfoLog );
		return;
	}
	else {
		std::cout << "Fragment shader successfully compiled" << std::endl;
	}

	glGenProgramPipelines( 1, &mainPipeline );
	glUseProgramStages( mainPipeline, GL_VERTEX_SHADER_BIT, vertexShaderProgram );
	glUseProgramStages( mainPipeline, GL_FRAGMENT_SHADER_BIT, fragmentShaderProgram );
#endif
	res_x_loc = glGetUniformLocation( fragmentShaderProgram, "res_x" );
	res_y_loc = glGetUniformLocation( fragmentShaderProgram, "res_y" );
	time_loc = glGetUniformLocation( fragmentShaderProgram, "time" );
	//tex_loc = glGetUniformLocation( fragmentShaderProgram, "tex" );
	//offc_loc = glGetUniformLocation( fragmentShaderProgram, "offc" );

}

SaraShaderManager::~SaraShaderManager() {}

GLuint SaraShaderManager::getPipeline() {
	return mainPipeline;
}


void SaraShaderManager::recompileShaders( void ) {

	vertexShaderSource = filetobuf( vertexShaderFilename.c_str() );
	fragmentShaderSource = filetobuf( fragmentShaderFilename.c_str() );
	GLint isLinked;

	vertexShaderProgram = glCreateShaderProgramv( GL_VERTEX_SHADER, 1, &vertexShaderSource );
	glGetProgramiv( vertexShaderProgram, GL_LINK_STATUS, &isLinked );
	if (isLinked == GL_FALSE) {
		int maxLength;
		char *vertexInfoLog;
		std::cout << "Vertex shader compile failed" << std::endl;
		glGetProgramiv( vertexShaderProgram, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( vertexShaderProgram, maxLength, &maxLength, vertexInfoLog );
		std::cout << vertexInfoLog << std::endl;
		free( vertexInfoLog );
		return;
	}
	else {
		std::cout << "Vertex shader successfully compiled" << std::endl;
	}

	fragmentShaderProgram = glCreateShaderProgramv( GL_FRAGMENT_SHADER, 1, &fragmentShaderSource );
	glGetProgramiv( fragmentShaderProgram, GL_LINK_STATUS, &isLinked );
	if (isLinked == GL_FALSE) {
		int maxLength;
		char *vertexInfoLog;
		std::cout << "Shader compile failed" << std::endl;
		glGetProgramiv( fragmentShaderProgram, GL_INFO_LOG_LENGTH, &maxLength );
		vertexInfoLog = (char *)malloc( maxLength );
		glGetProgramInfoLog( fragmentShaderProgram, maxLength, &maxLength, vertexInfoLog );
		std::cout << vertexInfoLog << std::endl;
		free( vertexInfoLog );
		return;
	}
	else {
		std::cout << "Fragment shader successfully compiled" << std::endl;
	}

	glGenProgramPipelines( 1, &mainPipeline );
	glUseProgramStages( mainPipeline, GL_VERTEX_SHADER_BIT, vertexShaderProgram );
	glUseProgramStages( mainPipeline, GL_FRAGMENT_SHADER_BIT, fragmentShaderProgram );
	res_x_loc = glGetUniformLocation( fragmentShaderProgram, "res_x" );
	res_y_loc = glGetUniformLocation( fragmentShaderProgram, "res_y" );
	time_loc = glGetUniformLocation( fragmentShaderProgram, "time" );
}

void SaraShaderManager::setUniforms( int resX, int resY, float time, int tex, float offc ) {
	glProgramUniform1i( fragmentShaderProgram, res_x_loc, resX );
	glProgramUniform1i( fragmentShaderProgram, res_y_loc, resY );
	glProgramUniform1f( fragmentShaderProgram, time_loc, time );
	// Solo postProcess
	glProgramUniform1i( fragmentShaderProgram, tex_loc, tex );		// impostare sempre a 0!
	glProgramUniform1f( fragmentShaderProgram, offc_loc, offc );
}

void SaraShaderManager::setUniforms( int resX, int resY, float time ) {
	glProgramUniform1i( fragmentShaderProgram, res_x_loc, resX );
	glProgramUniform1i( fragmentShaderProgram, res_y_loc, resY );
	glProgramUniform1f( fragmentShaderProgram, time_loc, time );
}


GLchar* SaraShaderManager::filetobuf( const char *file )
{
	FILE *fptr;
	long length;
	GLchar *buf;

	fopen_s( &fptr, file, "rb" );
	if (!fptr)
		return NULL;

	fseek( fptr, 0, SEEK_END );
	length = ftell( fptr );
	buf = (char*)malloc( length + 1 );
	fseek( fptr, 0, SEEK_SET );
	fread( buf, length, 1, fptr );
	fclose( fptr );
	buf[length] = 0;
	return buf;
}