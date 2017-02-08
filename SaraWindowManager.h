#pragma once
#include <iostream>
#include <gl\glew.h>
#include <GLFW\glfw3.h>

#include "Sara.h"

class SaraWindowManager {
public:
	SaraWindowManager( int xSize, int ySize );
	~SaraWindowManager();
	
	GLFWwindow *	getWndw() const;
	GLFWwindow *	getWndw();
	int				getXsize();
	int				getYsize();

private:
	GLFWwindow	*	window;
	int				x;
	int				y;

};