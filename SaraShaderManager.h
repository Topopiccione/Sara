#pragma once
#include <iostream>
#include <string>
#include <vector>
#include <gl\glew.h>
#include <GLFW\glfw3.h>
#include <glm\vec3.hpp>
#include <glm\gtc\type_ptr.hpp>

#include "Sara.h"

class SaraShaderManager {
public:
	SaraShaderManager( std::string vertexShaderFilename, std::string fragmentShaderFilename );
	SaraShaderManager( std::string vertexShaderFilename, std::vector<std::string> fragmentShaderFilenameVector );
	~SaraShaderManager();

	void setupShaders();
	void compileShaders();
	void checkGlobalShd();

	GLuint getPipeline();

	void	setUniforms( int resX, int resY, float time );
	void	setUniforms( int resX, int resY, float time, glm::vec3 camOrg, glm::vec3 camTrg, glm::vec3 camUpd );
	void	setUniforms( int resX, int resY, float time, glm::vec3 camOrg, glm::vec3 camTrg, glm::vec3 camUpd, int tex, int aaLev );
	void	setUniforms( int resX, int resY, float time, int tex, float offc );


private:
	GLchar* filetobuf( const char *file );

	// Filebuffers and filenames
	GLchar					*vertexShaderSource;
	GLchar					*fragmentShaderSource;
	std::string				vertexShaderFilename;
	std::string				fragmentShaderFilename;
	std::vector<std::string> fragmentShaderFilenameVector;

	// controllo
	int						currentFragShd;

	// Shader Programs
	GLuint					vertexShaderProgram;
	GLuint					fragmentShaderProgram;
	// Pipelines
	GLuint					mainPipeline;

	// Uniform locations
	GLuint					res_x_loc;
	GLuint					res_y_loc;
	GLuint					time_loc;
	GLuint					tex_loc;
	GLuint					offc_loc;
	GLuint					angle_loc;
	GLuint					aa_loc;

	GLuint					cameraOrg_loc;
	GLuint					cameraTrg_loc;
	GLuint					cameraUpd_loc;

	// coordinate rotazione
	float					rotaz[3];

};